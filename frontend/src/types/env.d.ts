declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_SIGNALR_URL: string;
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string;
      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: string;
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_FEATURE_AI_CHAT: string;
      NEXT_PUBLIC_FEATURE_PWA: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}

export {};
