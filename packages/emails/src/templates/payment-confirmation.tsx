import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface PaymentConfirmationEmailProps {
  amount: number;
  receiptUrl?: string;
}

export const PaymentConfirmationEmail = ({
  amount,
  receiptUrl,
}: PaymentConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Payment Successful - ${amount.toFixed(2)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Payment Successful ✓</Heading>
        <Text style={text}>
          Your payment of <strong>${amount.toFixed(2)}</strong> has been processed successfully.
        </Text>
        {receiptUrl && (
          <Section style={buttonContainer}>
            <Button style={button} href={receiptUrl}>
              View Receipt
            </Button>
          </Section>
        )}
        <Text style={footer}>
          Thank you for your business!
        </Text>
      </Container>
    </Body>
  </Html>
);

export default PaymentConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 40px',
  textAlign: 'center' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 40px',
  textAlign: 'center' as const,
};
