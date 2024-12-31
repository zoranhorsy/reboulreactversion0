import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/nodemailer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const lang = searchParams.get('lang') || 'fr';

    if (!email) {
        return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    try {
        console.log('Sending test email to:', email);
        console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

        const testOrder = {
            id: 'TEST-' + Date.now(),
            customerName: 'John Doe',
            email: email,
            shippingAddress: '123 Rue de la Paix, 75000 Paris, France',
            items: [
                { name: 'Produit Test', quantity: 1, price: 19.99 },
                { name: 'Autre Produit', quantity: 2, price: 9.99 }
            ],
            total: 39.97,
            trackingNumber: 'TR123456789FR',
            language: lang
        };

        const result = await sendConfirmationEmail(testOrder);
        console.log('Test email sent:', result);
        return NextResponse.json({ message: 'Test email sent', result });
    } catch (error) {
        console.error('Error sending test email:', error);
        return NextResponse.json({ error: 'Failed to send test email', details: error }, { status: 500 });
    }
}

