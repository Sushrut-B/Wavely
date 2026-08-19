import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_BASE = 'https://graph.instagram.com/v18.0';

export class WhatsAppService {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.client = axios.create({
      baseURL: WHATSAPP_API_BASE,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  /**
   * Send a message to a WhatsApp contact
   */
  async sendMessage(phoneNumber, message) {
    try {
      const response = await this.client.post(
        `/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: message,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send message error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Send a template message
   */
  async sendTemplate(phoneNumber, templateName, variables = []) {
    try {
      const response = await this.client.post(
        `/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: 'en_US',
            },
            components: [
              {
                type: 'body',
                parameters: variables.map((v) => ({ type: 'text', text: v })),
              },
            ],
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp send template error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId) {
    try {
      const response = await this.client.get(`/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('WhatsApp get status error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Upload media
   */
  async uploadMedia(mediaType, mediaData) {
    try {
      const response = await this.client.post(
        `/${process.env.WHATSAPP_PHONE_ID}/media`,
        {
          messaging_product: 'whatsapp',
          type: mediaType,
          file: mediaData,
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp upload media error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId) {
    try {
      const response = await this.client.post(
        `/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp mark as read error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get business profile
   */
  async getProfile() {
    try {
      const response = await this.client.get(
        `/${process.env.WHATSAPP_BUSINESS_ID}`,
        {
          fields: 'name,email,category,about,profile_picture_url',
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp get profile error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default WhatsAppService;
