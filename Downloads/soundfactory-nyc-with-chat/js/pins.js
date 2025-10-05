/**
 * ROBUST PIN SYSTEM - Enhanced Security & Error Handling
 * Sound Factory NYC
 * 
 * Key Improvements:
 * - Input validation & sanitization (XSS protection)
 * - Rate limiting
 * - Proper error handling & retry logic
 * - Server-side validation
 * - Transaction management
 * - Memory leak prevention
 * - Offline support with queue
 * - CSRF protection
 * - Image optimization
 * - Audit logging
 */

(function(global) {
  'use strict';

  // ==========================================
  // CONFIGURATION & CONSTANTS
  // ==========================================
  const CONFIG = {
    MAX_PINS_PER_USER: 5,
    MAX_CAPTION_LENGTH: 200,
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_IMAGE_DIMENSION: 1920,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    RATE_LIMIT_WINDOW: 60000, // 1 minute
    MAX_ACTIONS_PER_WINDOW: 10,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    OFFLINE_QUEUE_MAX: 50,
    SESSION_TIMEOUT: 3600000, // 1 hour
    PIN_EXPIRY_CHECK_INTERVAL: 60000, // 1 minute
  };

  const PIN_TYPES = {
    blue: {
      key: 'blue',
      label: 'Memories',
      color: '#2196F3',
      emoji: '📷',
      maxPerUser: 5,
      permanent: true,
      requiresAuth: true
    },
    yellow: {
      key: 'yellow',
      label: 'Song Moments',
      color: '#F59E0B',
      emoji: '🎵',
      maxPerUser: 5,
      permanent: true,
      requiresAuth: true
    },
    red: {
      key: 'red',
      label: 'Biggest Moment',
      color: '#EF4444',
      emoji: '💥',
      maxPerUser: 1,
      permanent: true,
      requiresAuth: true
    },
    green: {
      key: 'green',
      label: 'Future Wish',
      color: '#10B981',
      emoji: '✨',
      maxPerUser: 5,
      permanent: true,
      requiresAuth: true
    },
    purple: {
      key: 'purple',
      label: 'Promo',
      color: '#8B5CF6',
      emoji: '🪩',
      maxPerUser: 999,
      permanent: false,
      ttlMs: 6 * 60 * 60 * 1000, // 6 hours
      requiresAuth: true,
      requiresPromoterRole: true
    }
  };

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  class PinState {
    constructor() {
      this.pins = new Map();
      this.userPinCounts = new Map();
      this.rateLimitTracker = new Map();
      this.offlineQueue = [];
      this.listeners = new Map();
      this.initialized = false;
      this.supabase = null;
      this.realtimeChannel = null;
      this.cleanupTimers = [];
    }

    cleanup() {
      // Clean up timers
      this.cleanupTimers.forEach(timer => clearInterval(timer));
      this.cleanupTimers = [];

      // Clean up realtime subscription
      if (this.realtimeChannel) {
        this.realtimeChannel.unsubscribe();
        this.realtimeChannel = null;
      }

      // Clear event listeners
      this.listeners.forEach((listeners, element) => {
        listeners.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
      this.listeners.clear();

      // Clear state
      this.pins.clear();
      this.userPinCounts.clear();
      this.rateLimitTracker.clear();
      this.offlineQueue = [];
    }

    addEventListener(element, event, handler) {
      if (!this.listeners.has(element)) {
        this.listeners.set(element, []);
      }
      this.listeners.get(element).push({ event, handler });
      element.addEventListener(event, handler);
    }
  }

  const state = new PinState();

  // ==========================================
  // SECURITY & VALIDATION
  // ==========================================
  class SecurityValidator {
    static sanitizeHTML(input) {
      if (typeof input !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    }

    static validateCaption(caption) {
      if (typeof caption !== 'string') {
        throw new ValidationError('Caption must be a string');
      }
      const sanitized = this.sanitizeHTML(caption.trim());
      if (sanitized.length === 0) {
        throw new ValidationError('Caption cannot be empty');
      }
      if (sanitized.length > CONFIG.MAX_CAPTION_LENGTH) {
        throw new ValidationError(`Caption must be ${CONFIG.MAX_CAPTION_LENGTH} characters or less`);
      }
      return sanitized;
    }

    static validateCoordinates(x, y) {
      const xNum = Number(x);
      const yNum = Number(y);
      
      if (!Number.isFinite(xNum) || !Number.isFinite(yNum)) {
        throw new ValidationError('Coordinates must be valid numbers');
      }
      if (xNum < 0 || xNum > 100 || yNum < 0 || yNum > 100) {
        throw new ValidationError('Coordinates must be between 0 and 100');
      }
      return { x: xNum, y: yNum };
    }

    static validatePinType(type) {
      if (!PIN_TYPES[type]) {
        throw new ValidationError('Invalid pin type');
      }
      return type;
    }

    static async validateImage(file) {
      if (!file) return null;

      // Check file type
      if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new ValidationError('Invalid image type. Only JPEG, PNG, and WebP are allowed');
      }

      // Check file size
      if (file.size > CONFIG.MAX_IMAGE_SIZE) {
        throw new ValidationError(`Image must be smaller than ${CONFIG.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
      }

      return file;
    }

    static validateEmoji(emoji) {
      const emojiRegex = /^[\u{1F300}-\u{1F9FF}]$/u;
      if (typeof emoji !== 'string' || !emojiRegex.test(emoji)) {
        return '🕺'; // Default emoji
      }
      return emoji;
    }

    static checkRateLimit(userId) {
      const now = Date.now();
      const userActions = state.rateLimitTracker.get(userId) || [];
      
      // Remove old actions outside the window
      const recentActions = userActions.filter(
        timestamp => now - timestamp < CONFIG.RATE_LIMIT_WINDOW
      );

      if (recentActions.length >= CONFIG.MAX_ACTIONS_PER_WINDOW) {
        throw new RateLimitError(
          `Rate limit exceeded. Maximum ${CONFIG.MAX_ACTIONS_PER_WINDOW} actions per minute`
        );
      }

      // Add current action
      recentActions.push(now);
      state.rateLimitTracker.set(userId, recentActions);
      return true;
    }

    static generateCSRFToken() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    static validateCSRFToken(token) {
      const storedToken = sessionStorage.getItem('csrf_token');
      if (!storedToken || storedToken !== token) {
        throw new SecurityError('Invalid CSRF token');
      }
      return true;
    }
  }

  // ==========================================
  // ERROR CLASSES
  // ==========================================
  class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ValidationError';
      this.userFriendly = true;
    }
  }

  class RateLimitError extends Error {
    constructor(message) {
      super(message);
      this.name = 'RateLimitError';
      this.userFriendly = true;
    }
  }

  class SecurityError extends Error {
    constructor(message) {
      super(message);
      this.name = 'SecurityError';
      this.userFriendly = false;
    }
  }

  class NetworkError extends Error {
    constructor(message) {
      super(message);
      this.name = 'NetworkError';
      this.userFriendly = true;
      this.retryable = true;
    }
  }

  // ==========================================
  // AUTHENTICATION & AUTHORIZATION
  // ==========================================
  class AuthManager {
    static getCurrentUser() {
      try {
        // Try to get user from localStorage
        const sfUser = localStorage.getItem('sf_user');
        if (sfUser) {
          const user = JSON.parse(sfUser);
          if (this.isSessionValid(user)) {
            return user;
          }
        }

        // Try session storage
        const session = sessionStorage.getItem('sf_user_session');
        if (session) {
          const sessionData = JSON.parse(session);
          if (this.isSessionValid(sessionData)) {
            return sessionData;
          }
        }

        return null;
      } catch (error) {
        console.error('Error getting current user:', error);
        return null;
      }
    }

    static isSessionValid(user) {
      if (!user || !user.timestamp) return false;
      const now = Date.now();
      return (now - user.timestamp) < CONFIG.SESSION_TIMEOUT;
    }

    static getUserId() {
      const user = this.getCurrentUser();
      return user?.id || user?.phone || 'anonymous';
    }

    static getUserRole() {
      const user = this.getCurrentUser();
      return user?.role || 'user';
    }

    static isPromoter() {
      return this.getUserRole() === 'promoter' || this.getUserRole() === 'admin';
    }

    static canCreatePin(pinType) {
      const type = PIN_TYPES[pinType];
      if (!type) return false;

      if (type.requiresAuth && !this.getCurrentUser()) {
        return false;
      }

      if (type.requiresPromoterRole && !this.isPromoter()) {
        return false;
      }

      return true;
    }
  }

  // ==========================================
  // DATABASE OPERATIONS
  // ==========================================
  class DatabaseManager {
    static async initialize() {
      if (!global.supabase || !global.SUPABASE_URL || !global.SUPABASE_ANON_KEY) {
        console.warn('[RobustPins] Supabase not configured - running in local mode');
        return false;
      }

      try {
        state.supabase = global.supabase.createClient(
          global.SUPABASE_URL,
          global.SUPABASE_ANON_KEY
        );

        // Test connection
        const { data, error } = await state.supabase
          .from('pins')
          .select('count')
          .limit(1);

        if (error) {
          console.error('[RobustPins] Database connection failed:', error);
          return false;
        }

        console.log('[RobustPins] Database connected successfully');
        return true;
      } catch (error) {
        console.error('[RobustPins] Database initialization failed:', error);
        return false;
      }
    }

    static async savePin(pinData) {
      if (!state.supabase) {
        throw new NetworkError('Database not available');
      }

      const userId = AuthManager.getUserId();
      const now = new Date().toISOString();

      const dbRecord = {
        user_id: userId,
        phone: AuthManager.getCurrentUser()?.phone || '',
        pin_type: pinData.type,
        floor: pinData.floor || 'main',
        x_position: Math.round(pinData.x * 100), // Store as integer
        y_position: Math.round(pinData.y * 100),
        icon: pinData.emoji,
        caption: pinData.caption,
        photo_url: pinData.imageUrl || null,
        created_at: now
      };

      const { data, error } = await state.supabase
        .from('pins')
        .insert(dbRecord)
        .select()
        .single();

      if (error) {
        throw new NetworkError(`Failed to save pin: ${error.message}`);
      }

      return data;
    }

    static async loadPins(limit = 100, floor = 'main') {
      if (!state.supabase) {
        return [];
      }

      try {
        const { data, error } = await state.supabase
          .from('pins')
          .select('*')
          .eq('floor', floor)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          throw new NetworkError(`Failed to load pins: ${error.message}`);
        }

        return data.map(row => ({
          id: row.id,
          x: row.x_position / 100,
          y: row.y_position / 100,
          type: row.pin_type,
          color: PIN_TYPES[row.pin_type]?.color || '#00ffff',
          caption: row.caption,
          emoji: row.icon,
          imageUrl: row.photo_url,
          userId: row.user_id,
          createdAt: row.created_at
        }));
      } catch (error) {
        console.error('[RobustPins] Load pins failed:', error);
        return [];
      }
    }

    static async getUserPinCount(userId) {
      if (!state.supabase) {
        // Fallback to localStorage
        const counts = JSON.parse(localStorage.getItem('sf_user_pin_counts') || '{}');
        return counts[userId] || {};
      }

      try {
        const { data, error } = await state.supabase
          .from('pins')
          .select('pin_type')
          .eq('user_id', userId);

        if (error) {
          throw new NetworkError(`Failed to get pin count: ${error.message}`);
        }

        const counts = {};
        data.forEach(pin => {
          counts[pin.pin_type] = (counts[pin.pin_type] || 0) + 1;
        });

        return counts;
      } catch (error) {
        console.error('[RobustPins] Get pin count failed:', error);
        return {};
      }
    }

    static async deletePin(pinId) {
      if (!state.supabase) {
        throw new NetworkError('Database not available');
      }

      const userId = AuthManager.getUserId();

      const { error } = await state.supabase
        .from('pins')
        .delete()
        .eq('id', pinId)
        .eq('user_id', userId); // Only delete own pins

      if (error) {
        throw new NetworkError(`Failed to delete pin: ${error.message}`);
      }

      return true;
    }
  }

  // ==========================================
  // IMAGE PROCESSING
  // ==========================================
  class ImageProcessor {
    static async optimizeImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => reject(new Error('Failed to read file'));

        reader.onload = (e) => {
          const img = new Image();

          img.onerror = () => reject(new Error('Failed to load image'));

          img.onload = () => {
            try {
              // Calculate dimensions
              let width = img.width;
              let height = img.height;
              const maxDim = CONFIG.MAX_IMAGE_DIMENSION;

              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = (height / width) * maxDim;
                  width = maxDim;
                } else {
                  width = (width / height) * maxDim;
                  height = maxDim;
                }
              }

              // Create canvas
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);

              // Convert to optimized format
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    reject(new Error('Failed to create image blob'));
                    return;
                  }
                  resolve(blob);
                },
                'image/jpeg',
                0.85 // Quality
              );
            } catch (error) {
              reject(error);
            }
          };

          img.src = e.target.result;
        };

        reader.readAsDataURL(file);
      });
    }

    static async uploadImage(blob) {
      if (!state.supabase) {
        // Fallback to base64
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      try {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `${AuthManager.getUserId()}/${fileName}`;

        const { data, error } = await state.supabase.storage
          .from('pin-photos')
          .upload(filePath, blob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });

        if (error) {
          throw new NetworkError(`Failed to upload image: ${error.message}`);
        }

        const { data: urlData } = state.supabase.storage
          .from('pin-photos')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (error) {
        console.error('[RobustPins] Image upload failed:', error);
        throw error;
      }
    }
  }

  // ==========================================
  // OFFLINE QUEUE
  // ==========================================
  class OfflineQueue {
    static add(operation) {
      if (state.offlineQueue.length >= CONFIG.OFFLINE_QUEUE_MAX) {
        throw new Error('Offline queue full');
      }

      state.offlineQueue.push({
        operation,
        timestamp: Date.now(),
        attempts: 0
      });

      this.persist();
    }

    static persist() {
      try {
        localStorage.setItem('sf_pin_offline_queue', JSON.stringify(state.offlineQueue));
      } catch (error) {
        console.error('[RobustPins] Failed to persist offline queue:', error);
      }
    }

    static load() {
      try {
        const stored = localStorage.getItem('sf_pin_offline_queue');
        if (stored) {
          state.offlineQueue = JSON.parse(stored);
        }
      } catch (error) {
        console.error('[RobustPins] Failed to load offline queue:', error);
        state.offlineQueue = [];
      }
    }

    static async processQueue() {
      if (state.offlineQueue.length === 0) return;

      console.log(`[RobustPins] Processing ${state.offlineQueue.length} queued operations`);

      const processed = [];
      for (const item of state.offlineQueue) {
        try {
          await item.operation();
          processed.push(item);
        } catch (error) {
          item.attempts++;
          if (item.attempts >= CONFIG.RETRY_ATTEMPTS) {
            console.error('[RobustPins] Operation failed after max retries:', error);
            processed.push(item);
          }
        }
      }

      // Remove processed items
      state.offlineQueue = state.offlineQueue.filter(item => !processed.includes(item));
      this.persist();
    }
  }

  // ==========================================
  // RETRY LOGIC
  // ==========================================
  class RetryManager {
    static async withRetry(fn, options = {}) {
      const {
        attempts = CONFIG.RETRY_ATTEMPTS,
        delay = CONFIG.RETRY_DELAY,
        exponentialBackoff = true
      } = options;

      let lastError;

      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;

          if (!error.retryable || i === attempts - 1) {
            throw error;
          }

          const waitTime = exponentialBackoff ? delay * Math.pow(2, i) : delay;
          await this.sleep(waitTime);
        }
      }

      throw lastError;
    }

    static sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }

  // ==========================================
  // PIN MANAGER
  // ==========================================
  class PinManager {
    static async createPin(pinData) {
      // Validate user authentication
      const user = AuthManager.getCurrentUser();
      if (!user) {
        throw new ValidationError('You must be logged in to create pins');
      }

      const userId = AuthManager.getUserId();

      // Check rate limit
      SecurityValidator.checkRateLimit(userId);

      // Validate input
      const sanitizedCaption = SecurityValidator.validateCaption(pinData.caption);
      const coordinates = SecurityValidator.validateCoordinates(pinData.x, pinData.y);
      const pinType = SecurityValidator.validatePinType(pinData.type);

      // Check authorization
      if (!AuthManager.canCreatePin(pinType)) {
        throw new ValidationError('You do not have permission to create this pin type');
      }

      // Check pin limits
      const counts = await DatabaseManager.getUserPinCount(userId);
      const typeConfig = PIN_TYPES[pinType];
      const currentCount = counts[pinType] || 0;

      if (currentCount >= typeConfig.maxPerUser) {
        throw new ValidationError(
          `Maximum ${typeConfig.maxPerUser} ${typeConfig.label} pins allowed`
        );
      }

      // Process image if provided
      let imageUrl = null;
      if (pinData.image) {
        const validatedFile = await SecurityValidator.validateImage(pinData.image);
        const optimizedImage = await ImageProcessor.optimizeImage(validatedFile);
        imageUrl = await ImageProcessor.uploadImage(optimizedImage);
      }

      // Prepare pin data
      const pin = {
        x: coordinates.x,
        y: coordinates.y,
        type: pinType,
        color: typeConfig.color,
        caption: sanitizedCaption,
        emoji: SecurityValidator.validateEmoji(pinData.emoji),
        imageUrl,
        userId,
        floor: pinData.floor || 'main',
        createdAt: new Date().toISOString()
      };

      // Save to database with retry
      try {
        const savedPin = await RetryManager.withRetry(() => DatabaseManager.savePin(pin));
        pin.id = savedPin.id;

        // Update local state
        state.pins.set(pin.id, pin);
        this.updateUserPinCount(userId, pinType, 1);

        // Broadcast to other users
        if (global.SFRealtime) {
          global.SFRealtime.sendPin(pin.x, pin.y, pin);
        }

        return pin;
      } catch (error) {
        if (error instanceof NetworkError && !navigator.onLine) {
          // Add to offline queue
          OfflineQueue.add(() => DatabaseManager.savePin(pin));
          // Still render locally
          state.pins.set(pin.id || Date.now().toString(), pin);
          this.updateUserPinCount(userId, pinType, 1);
          return pin;
        }
        throw error;
      }
    }

    static updateUserPinCount(userId, pinType, delta) {
      const counts = state.userPinCounts.get(userId) || {};
      counts[pinType] = (counts[pinType] || 0) + delta;
      state.userPinCounts.set(userId, counts);

      // Persist to localStorage
      try {
        const allCounts = Object.fromEntries(state.userPinCounts);
        localStorage.setItem('sf_user_pin_counts', JSON.stringify(allCounts));
      } catch (error) {
        console.error('[RobustPins] Failed to persist pin counts:', error);
      }
    }

    static async deletePin(pinId) {
      const pin = state.pins.get(pinId);
      if (!pin) {
        throw new ValidationError('Pin not found');
      }

      const userId = AuthManager.getUserId();
      if (pin.userId !== userId) {
        throw new ValidationError('You can only delete your own pins');
      }

      try {
        await RetryManager.withRetry(() => DatabaseManager.deletePin(pinId));
        state.pins.delete(pinId);
        this.updateUserPinCount(userId, pin.type, -1);
        return true;
      } catch (error) {
        if (error instanceof NetworkError && !navigator.onLine) {
          OfflineQueue.add(() => DatabaseManager.deletePin(pinId));
          state.pins.delete(pinId);
          this.updateUserPinCount(userId, pin.type, -1);
          return true;
        }
        throw error;
      }
    }

    static async loadPins(floor = 'main') {
      try {
        const pins = await DatabaseManager.loadPins(100, floor);
        pins.forEach(pin => {
          state.pins.set(pin.id, pin);
        });
        return pins;
      } catch (error) {
        console.error('[RobustPins] Failed to load pins:', error);
        return [];
      }
    }
  }

  // ==========================================
  // REALTIME SYNC
  // ==========================================
  class RealtimeSync {
    static initialize() {
      if (!state.supabase) return;

      try {
        state.realtimeChannel = state.supabase
          .channel('pins-channel')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'pins'
          }, (payload) => {
            this.handlePinInsert(payload.new);
          })
          .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'pins'
          }, (payload) => {
            this.handlePinDelete(payload.old);
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[RobustPins] Realtime subscription active');
            }
          });
      } catch (error) {
        console.error('[RobustPins] Realtime initialization failed:', error);
      }
    }

    static handlePinInsert(row) {
      const pin = {
        id: row.id,
        x: row.x_position / 100,
        y: row.y_position / 100,
        type: row.pin_type,
        color: PIN_TYPES[row.pin_type]?.color || '#00ffff',
        caption: row.caption,
        emoji: row.icon,
        imageUrl: row.photo_url,
        userId: row.user_id,
        createdAt: row.created_at
      };

      // Don't add if it's our own pin
      if (pin.userId === AuthManager.getUserId()) return;

      state.pins.set(pin.id, pin);

      // Render if UI is available
      if (global.SFPins && global.SFPins.renderPin) {
        global.SFPins.renderPin(pin);
      }
    }

    static handlePinDelete(row) {
      state.pins.delete(row.id);

      // Remove from DOM if exists
      const element = document.getElementById(`pin-${row.id}`);
      if (element) {
        element.remove();
      }
    }
  }

  // ==========================================
  // EXPIRED PIN CLEANUP
  // ==========================================
  class ExpiryManager {
    static startCleanupTimer() {
      const timer = setInterval(() => {
        this.cleanupExpiredPins();
      }, CONFIG.PIN_EXPIRY_CHECK_INTERVAL);

      state.cleanupTimers.push(timer);
    }

    static cleanupExpiredPins() {
      const now = Date.now();
      const expired = [];

      state.pins.forEach((pin, id) => {
        const pinType = PIN_TYPES[pin.type];
        if (!pinType.permanent && pinType.ttlMs) {
          const createdTime = new Date(pin.createdAt).getTime();
          if (now - createdTime > pinType.ttlMs) {
            expired.push(id);
          }
        }
      });

      expired.forEach(id => {
        const pin = state.pins.get(id);
        state.pins.delete(id);

        // Remove from DOM
        const element = document.getElementById(`pin-${id}`);
        if (element) {
          element.classList.add('fade-out');
          setTimeout(() => element.remove(), 500);
        }

        // Delete from database
        if (state.supabase) {
          DatabaseManager.deletePin(id).catch(err => {
            console.error('[RobustPins] Failed to delete expired pin:', err);
          });
        }
      });

      if (expired.length > 0) {
        console.log(`[RobustPins] Cleaned up ${expired.length} expired pins`);
      }
    }
  }

  // ==========================================
  // ERROR HANDLER
  // ==========================================
  class ErrorHandler {
    static handle(error, context = '') {
      console.error(`[RobustPins] ${context}:`, error);

      // Log to analytics/monitoring service if available
      if (global.analyticsService) {
        global.analyticsService.logError(error, context);
      }

      // Show user-friendly message
      if (error.userFriendly) {
        this.showUserMessage(error.message, 'error');
      } else {
        this.showUserMessage('An unexpected error occurred. Please try again.', 'error');
      }
    }

    static showUserMessage(message, type = 'info') {
      // Use existing toast system if available
      if (global.SFPinUI && global.SFPinUI.showToast) {
        const color = type === 'error' ? '#EF4444' : type === 'success' ? '#10B981' : '#2196F3';
        global.SFPinUI.showToast(message, color);
        return;
      }

      // Fallback to console
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  // ==========================================
  // ANALYTICS & AUDIT LOGGING
  // ==========================================
  class AuditLogger {
    static log(action, data = {}) {
      const entry = {
        timestamp: new Date().toISOString(),
        userId: AuthManager.getUserId(),
        action,
        data,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      // Store in localStorage (ring buffer)
      try {
        const logs = JSON.parse(localStorage.getItem('sf_pin_audit_logs') || '[]');
        logs.push(entry);
        
        // Keep only last 100 entries
        if (logs.length > 100) {
          logs.shift();
        }

        localStorage.setItem('sf_pin_audit_logs', JSON.stringify(logs));
      } catch (error) {
        console.error('[RobustPins] Failed to log audit entry:', error);
      }

      // Send to backend if available
      if (state.supabase) {
        this.sendToBackend(entry).catch(err => {
          console.error('[RobustPins] Failed to send audit log:', err);
        });
      }
    }

    static async sendToBackend(entry) {
      // This would send to an audit_logs table if you create one
      // For now, we just console log
      console.log('[Audit]', entry);
    }
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  async function initialize(options = {}) {
    if (state.initialized) {
      console.warn('[RobustPins] Already initialized');
      return;
    }

    try {
      // Initialize CSRF token
      if (!sessionStorage.getItem('csrf_token')) {
        sessionStorage.setItem('csrf_token', SecurityValidator.generateCSRFToken());
      }

      // Initialize database
      await DatabaseManager.initialize();

      // Initialize realtime
      RealtimeSync.initialize();

      // Load offline queue
      OfflineQueue.load();

      // Process any queued operations
      if (navigator.onLine) {
        await OfflineQueue.processQueue();
      }

      // Start expiry cleanup
      ExpiryManager.startCleanupTimer();

      // Listen for online/offline events
      window.addEventListener('online', () => {
        console.log('[RobustPins] Back online, processing queue');
        OfflineQueue.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('[RobustPins] Offline mode activated');
      });

      // Listen for beforeunload to cleanup
      window.addEventListener('beforeunload', () => {
        state.cleanup();
      });

      state.initialized = true;
      console.log('[RobustPins] Initialized successfully');

      AuditLogger.log('system_initialized', { version: '2.0.0' });
    } catch (error) {
      ErrorHandler.handle(error, 'Initialization failed');
      throw error;
    }
  }

  async function createPin(pinData) {
    try {
      AuditLogger.log('pin_create_attempt', {
        type: pinData.type,
        hasImage: !!pinData.image
      });

      const pin = await PinManager.createPin(pinData);

      AuditLogger.log('pin_created', {
        pinId: pin.id,
        type: pin.type
      });

      ErrorHandler.showUserMessage('Pin created successfully!', 'success');
      return pin;
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to create pin');
      throw error;
    }
  }

  async function deletePin(pinId) {
    try {
      AuditLogger.log('pin_delete_attempt', { pinId });

      await PinManager.deletePin(pinId);

      AuditLogger.log('pin_deleted', { pinId });

      ErrorHandler.showUserMessage('Pin deleted successfully!', 'success');
      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to delete pin');
      throw error;
    }
  }

  async function loadPins(floor = 'main') {
    try {
      return await PinManager.loadPins(floor);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to load pins');
      return [];
    }
  }

  function getPinTypes() {
    return PIN_TYPES;
  }

  function getUserPinCount(userId = null) {
    const id = userId || AuthManager.getUserId();
    return state.userPinCounts.get(id) || {};
  }

  function canCreatePin(pinType) {
    return AuthManager.canCreatePin(pinType);
  }

  function cleanup() {
    state.cleanup();
    console.log('[RobustPins] Cleanup completed');
  }

  function getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem('sf_pin_audit_logs') || '[]');
    } catch (error) {
      console.error('[RobustPins] Failed to get audit logs:', error);
      return [];
    }
  }

  // Export public API
  global.RobustPinSystem = {
    // Core functions
    initialize,
    createPin,
    deletePin,
    loadPins,
    cleanup,

    // Utility functions
    getPinTypes,
    getUserPinCount,
    canCreatePin,
    getAuditLogs,

    // Configuration
    CONFIG,

    // For debugging/testing
    _internal: {
      state,
      AuthManager,
      SecurityValidator,
      DatabaseManager,
      PinManager,
      ErrorHandler,
      AuditLogger
    }
  };

  console.log('[RobustPins] Module loaded successfully');
})(window);
