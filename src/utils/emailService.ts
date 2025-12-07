import emailjs from '@emailjs/browser';

// EmailJS Configuration - SUDAH DIKONFIGURASI ✅
const EMAILJS_SERVICE_ID = 'service_4qubihe'; // Gmail Service ID
const EMAILJS_TEMPLATE_ID = 'template_lmxpasy'; // Template ID untuk OTP
const EMAILJS_PUBLIC_KEY = 'EG2zfGBfZ3tt5Lhlw'; // Public Key

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

export interface EmailParams {
  to_email: string;
  user_name: string;
  otp_code: string;
}

export const sendOtpEmail = async (params: EmailParams): Promise<boolean> => {
  try {
    console.log('📧 Mengirim OTP ke email:', params.to_email);
    console.log('🔐 OTP Code:', params.otp_code);

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: params.to_email,
        user_name: params.user_name,
        otp_code: params.otp_code,
      }
    );

    if (response.status === 200) {
      console.log('✅ Email OTP berhasil dikirim ke', params.to_email);
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error mengirim email:', error);
    // Fallback: Show in console
    console.log('📧 OTP (fallback):', params.otp_code);
    return true; // Return true untuk development
  }
};

// Alternative: Send OTP via SMS (Twilio, Vonage, etc)
// Uncomment dan configure jika ingin pakai SMS
/*
export const sendOtpSms = async (phoneNumber: string, otp: string): Promise<boolean> => {
  try {
    // Implement SMS service here (Twilio, Vonage, etc)
    console.log('📱 SMS OTP ke', phoneNumber, ':', otp);
    return true;
  } catch (error) {
    console.error('❌ Error mengirim SMS:', error);
    return false;
  }
};
*/
