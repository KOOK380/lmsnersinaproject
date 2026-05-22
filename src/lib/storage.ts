import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Storage } from '@google-cloud/storage';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import { v2 as cloudinary } from 'cloudinary';

export const uploadToStorage = async (file: Express.Multer.File, config: any): Promise<string> => {
  if (!config || !config.activeProvider || config.activeProvider === 'local') {
    // If local, return base64 for now or save to disk. Since this is in-memory for preview:
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  let { activeProvider, activeImageProvider, activeVideoProvider, providers } = config;
  
  if (file.mimetype.startsWith('image/') && activeImageProvider && activeImageProvider !== '') {
    activeProvider = activeImageProvider;
  } else if (file.mimetype.startsWith('video/') && activeVideoProvider && activeVideoProvider !== '') {
    activeProvider = activeVideoProvider;
  }

  const providerConfig = providers[activeProvider] || providers[config.activeProvider];

  if (!providerConfig) {
    throw new Error(`Provider config for ${activeProvider} not found.`);
  }

  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;

  try {
    if (activeProvider === 'supabase') {
      const supabase = createClient(providerConfig.url, providerConfig.key);
      
      let uploadResult = await supabase.storage
        .from(providerConfig.bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadResult.error && uploadResult.error.message.includes('Bucket not found')) {
        // Attempt to create the public bucket
        const { error: createError } = await supabase.storage.createBucket(providerConfig.bucket, {
          public: true
        });
        
        if (createError && !createError.message.includes('already exists')) {
            throw new Error('Failed to create bucket dynamically: ' + createError.message);
        }

        // Retry upload
        uploadResult = await supabase.storage
          .from(providerConfig.bucket)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });
      }

      if (uploadResult.error) throw uploadResult.error;
      const { data: publicUrlData } = supabase.storage.from(providerConfig.bucket).getPublicUrl(fileName);
      return publicUrlData.publicUrl;
    }

    if (activeProvider === 's3' || activeProvider === 'b2') {
      const s3Client = new S3Client({
        region: providerConfig.region,
        endpoint: providerConfig.endpoint || undefined, // B2 uses custom endpoint
        credentials: {
          accessKeyId: providerConfig.accessKeyId,
          secretAccessKey: providerConfig.secretAccessKey,
        },
      });

      await s3Client.send(new PutObjectCommand({
        Bucket: providerConfig.bucket,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Deprecated in some AWS regions, but common
      }));

      if (activeProvider === 'b2') {
        const urlObj = new URL(providerConfig.endpoint);
        return `https://${providerConfig.bucket}.${urlObj.hostname}/${fileName}`;
      } else {
        return `https://${providerConfig.bucket}.s3.${providerConfig.region}.amazonaws.com/${fileName}`;
      }
    }

    if (activeProvider === 'gcs') {
      const storage = new Storage({
        projectId: providerConfig.projectId,
        credentials: {
          client_email: providerConfig.clientEmail,
          private_key: providerConfig.privateKey.replace(/\\n/g, '\n'),
        },
      });
      const bucket = storage.bucket(providerConfig.bucket);
      const gcfile = bucket.file(fileName);
      await gcfile.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });
      return `https://storage.googleapis.com/${providerConfig.bucket}/${fileName}`;
    }

    if (activeProvider === 'bunny') {
      const regionPrefix = providerConfig.region ? `${providerConfig.region}.` : '';
      const url = `https://${regionPrefix}storage.bunnycdn.com/${providerConfig.storageZoneName}/${fileName}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          AccessKey: providerConfig.accessKey,
          'Content-Type': file.mimetype,
        },
        body: file.buffer,
      });
      
      if (!response.ok) {
        throw new Error('BunnyCDN upload failed: ' + await response.text());
      }
      
      let pullZoneUrl = providerConfig.pullZoneUrl;
      if (pullZoneUrl.endsWith('/')) pullZoneUrl = pullZoneUrl.slice(0, -1);
      if (!pullZoneUrl.startsWith('http')) pullZoneUrl = 'https://' + pullZoneUrl;
      return `${pullZoneUrl}/${fileName}`;
    }

    if (activeProvider === 'cloudinary') {
      cloudinary.config({
        cloud_name: providerConfig.cloudName,
        api_key: providerConfig.apiKey,
        api_secret: providerConfig.apiSecret,
      });

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: providerConfig.folder || 'uploads',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) return reject(error);
            if (result) return resolve(result.secure_url);
            reject(new Error("No result from cloudinary"));
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    throw new Error('Unknown storage provider');
  } catch (error) {
    console.error(`Storage Upload Error (${activeProvider}):`, error);
    throw error;
  }
};
