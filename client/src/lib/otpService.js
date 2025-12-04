// lib/OTPService.js
// Mock OTP Service for testing - Replace with Authentica.sa in production

class OTPServiceClass {
  constructor() {
    // Store OTPs in memory (in production, this would be handled server-side)
    this.otpStore = new Map();
    this.OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
    this.MAX_ATTEMPTS = 3;
  }

  /**
   * Generate a random 6-digit OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Validate Saudi phone number format
   */
  validatePhoneNumber(phone) {
    const saudiRegex = /^(05|5)([0-9]{8})$/;
    const cleanPhone = phone.replace(/[\s-]/g, '');
    return saudiRegex.test(cleanPhone);
  }

  /**
   * Format phone number to standard format
   */
  formatPhoneNumber(phone) {
    const cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('05')) return cleaned;
    if (cleaned.startsWith('5')) return '0' + cleaned;
    return cleaned;
  }

  /**
   * Send OTP to phone number (Mock implementation)
   * In production: Replace with Authentica.sa API call
   */
  async sendOTP(phoneNumber) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (!this.validatePhoneNumber(phoneNumber)) {
            reject(new Error('Invalid phone number format'));
            return;
          }

          const formattedPhone = this.formatPhoneNumber(phoneNumber);
          const otp = this.generateOTP();
          const expiresAt = Date.now() + this.OTP_EXPIRY;

          // Store OTP with metadata
          this.otpStore.set(formattedPhone, {
            otp,
            expiresAt,
            attempts: 0,
            createdAt: Date.now(),
          });

          // Mock: Log OTP to console (Remove in production!)
          console.log(`🔐 MOCK OTP for ${formattedPhone}: ${otp}`);

          resolve({
            success: true,
            message: 'OTP sent successfully',
            phoneNumber: formattedPhone,
            expiresIn: this.OTP_EXPIRY / 1000, // in seconds
            // In mock mode, return OTP for testing (NEVER do this in production!)
            _mockOTP: otp,
          });
        } catch (error) {
          reject(error);
        }
      }, 1500); // Simulate network delay
    });
  }

  /**
   * Verify OTP code
   */
  async verifyOTP(phoneNumber, otpCode) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const formattedPhone = this.formatPhoneNumber(phoneNumber);
          const storedData = this.otpStore.get(formattedPhone);

          if (!storedData) {
            reject(new Error('No OTP found for this phone number'));
            return;
          }

          // Check if OTP is expired
          if (Date.now() > storedData.expiresAt) {
            this.otpStore.delete(formattedPhone);
            reject(new Error('OTP has expired'));
            return;
          }

          // Check max attempts
          if (storedData.attempts >= this.MAX_ATTEMPTS) {
            this.otpStore.delete(formattedPhone);
            reject(new Error('Maximum verification attempts exceeded'));
            return;
          }

          // Increment attempts
          storedData.attempts++;

          // Verify OTP
          if (storedData.otp === otpCode) {
            // Clean up after successful verification
            this.otpStore.delete(formattedPhone);
            
            resolve({
              success: true,
              message: 'Phone number verified successfully',
              phoneNumber: formattedPhone,
              verified: true,
            });
          } else {
            const remainingAttempts = this.MAX_ATTEMPTS - storedData.attempts;
            reject(new Error(
              `Invalid OTP code. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`
            ));
          }
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simulate network delay
    });
  }

  /**
   * Resend OTP (generates new code)
   */
  async resendOTP(phoneNumber) {
    // Clear existing OTP first
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    this.otpStore.delete(formattedPhone);
    
    // Send new OTP
    return this.sendOTP(phoneNumber);
  }

  /**
   * Check if phone number has pending OTP
   */
  hasPendingOTP(phoneNumber) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);
    
    if (!storedData) return false;
    
    // Check if not expired
    return Date.now() <= storedData.expiresAt;
  }

  /**
   * Get remaining time for OTP
   */
  getRemainingTime(phoneNumber) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const storedData = this.otpStore.get(formattedPhone);
    
    if (!storedData) return 0;
    
    const remaining = Math.max(0, storedData.expiresAt - Date.now());
    return Math.ceil(remaining / 1000); // in seconds
  }

  /**
   * Clean up expired OTPs (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [phone, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(phone);
      }
    }
  }
}

// Singleton instance
export const OTPService = new OTPServiceClass();

// Clean up expired OTPs every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    OTPService.cleanup();
  }, 60000);
}

export default OTPService;