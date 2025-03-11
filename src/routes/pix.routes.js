const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const PixCredential = require('../models/pixCredential.model');
const { verifyToken } = require('../middleware/auth');
const axios = require('axios');

// Generate PIX QR Code
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Get active PIX credentials
        const pixCredential = await PixCredential.findOne({ isActive: true });
        if (!pixCredential) {
            return res.status(500).json({ message: 'PIX credentials not configured' });
        }


        console.log(pixCredential)
        // Generate a unique external ID for this transaction
        const externalId = `PIX_${Date.now()}`;

        // Create a pending transaction record
        const transaction = new Transaction({
            userId: req.user.id,
            type: 'DEPOSIT',
            amount: amount,
            status: 'PENDING',
            externalReference: externalId,
            paymentMethod: 'PIX'
        });

        await transaction.save();

        // Prepare credentials
        const credentials = `${pixCredential.clientId}:${pixCredential.clientSecret}`;
        const base64Credentials = Buffer.from(credentials).toString('base64');

        console.log(pixCredential.baseUrl)
        // Get auth token
        const tokenResponse = await axios.post(
            `${pixCredential.baseUrl}/oauth/token`,
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${base64Credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }
        );

        const token = tokenResponse.data.access_token;

        let data = JSON.stringify({
            "amount": parseFloat(amount),
            "postbackUrl": pixCredential.webhookUrl,
            "payer": {
                "name": "teste",
                "document": "123456789",
                "email": "teste@gmail.com"
            }
        });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${pixCredential.baseUrl}/pix/qrcode`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            data: data
        };

        const pixResponse = await axios.request(config);

        res.json({
            message: 'PIX QR Code generated successfully',
            transaction_id: transaction._id,
            external_id: externalId,
            qr_code: pixResponse.data.qrcode,
            amount: amount
        });

    } catch (error) {
        console.error('Error generating PIX QR Code:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error generating PIX QR Code', error: error.response ? error.response.data : error.message });
    }
});

// Webhook endpoint for PIX payment notifications
router.post('/webhook', async (req, res) => {
    try {
        const { requestBody } = req.body;

        console.log(`PIX RECEBIDO`);
        console.log('Webhook data:', JSON.stringify(requestBody));
        
        if (!requestBody || requestBody.status !== 'PAID') {
            return res.status(400).json({ message: 'Invalid webhook data' });
        }

        // Encontrar a transação PIX pendente mais recente
        const latestTransaction = await Transaction.findOne({
            type: 'DEPOSIT',
            status: 'PENDING',
            paymentMethod: 'PIX'
        }).sort({ createdAt: -1 });

        if (!latestTransaction) {
            console.log('Nenhuma transação PIX pendente encontrada');
            return res.status(404).json({ message: 'No pending PIX transaction found' });
        }

        console.log(`Atualizando transação ${latestTransaction._id}`);

        // Atualizar status da transação
        latestTransaction.status = 'COMPLETED';
        latestTransaction.metadata = {
            pixTransactionId: requestBody.transactionId || 'unknown',
            dateApproval: requestBody.dateApproval || new Date(),
            payerInfo: requestBody.creditParty || {},
            webhookData: requestBody
        };

        // Permitir que apenas o middleware atualize o saldo
        await latestTransaction.save();

        // Verificar se o saldo foi atualizado (para debug)
        const updatedUser = await User.findById(latestTransaction.userId);
        console.log(`Saldo do usuário atualizado: ${updatedUser.balance}`);

        await axios.get(`https://api.pushcut.io/ChzkB6ZYQL5SvlUwWpo2i/notifications/Venda%20Realizada`)
        res.json({ message: 'Pagamento processado com sucesso' });

    } catch (error) {
        console.error('Erro ao processar webhook PIX:', error);
        res.status(500).json({ message: 'Erro ao processar notificação de pagamento' });
    }
});

// Check PIX payment status
router.get('/status/:external_id', verifyToken, async (req, res) => {
    try {
        const { external_id } = req.params;

        // Find the transaction by external ID
        const transaction = await Transaction.findOne({ "externalReference": external_id });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Check if the user has permission to view this transaction
        if (transaction.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized to view this transaction' });
        }

        res.json({
            status: transaction.status,
            transaction_id: transaction._id,
            external_id: transaction.external_id,
            amount: transaction.amount,
            created_at: transaction.createdAt,
            updated_at: transaction.updatedAt,
            metadata: transaction.metadata
        });

    } catch (error) {
        console.error('Error checking PIX payment status:', error);
        res.status(500).json({ message: 'Error checking payment status' });
    }
});

module.exports = router;
