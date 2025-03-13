import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const baseURL = process.env.BASE_URL_CHAT_BOT;
const apiKey = process.env.API_KEY;
const http = axios.create({
  baseURL: baseURL,
  timeout: 100000,
  headers: { 'Content-Type': 'application/json' }
});
http.defaults.headers.common['Authorization'] = ('Bearer ' + apiKey) as string;
export default http;
