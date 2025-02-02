import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../utils/aws-config';

interface UserData {
  username: string;
  password: string;
  balance: number;
  createdAt: string;
}

export async function registerUser(username: string, password: string): Promise<boolean> {
  try {
    // Check if user exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `users/${username}.json`
        })
      );
      return false; // User already exists
    } catch {
      // User doesn't exist, continue with registration
    }

    const userData: UserData = {
      username,
      password: await hashPassword(password),
      balance: 1000,
      createdAt: new Date().toISOString()
    };

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${username}.json`,
        Body: JSON.stringify(userData),
        ContentType: 'application/json'
      })
    );
    return true;
  } catch (error) {
    console.error('Error registering user:', error);
    return false;
  }
}

export async function loginUser(username: string, password: string): Promise<UserData | null> {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${username}.json`
      })
    );

    const userData: UserData = JSON.parse(await response.Body!.transformToString());
    
    if (await verifyPassword(password, userData.password)) {
      return userData;
    }
    return null;
  } catch (error) {
    console.error('Error logging in:', error);
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const hashed = await hashPassword(password);
  return hashed === hashedPassword;
}

export async function updateUserBalance(username: string, newBalance: number): Promise<boolean> {
  try {
    // Get current user data
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${username}.json`
      })
    );

    const userData = JSON.parse(await response.Body!.transformToString());
    userData.balance = newBalance;

    // Update user data in S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `users/${username}.json`,
        Body: JSON.stringify(userData),
        ContentType: 'application/json'
      })
    );
    return true;
  } catch (error) {
    console.error('Error updating balance:', error);
    return false;
  }
} 