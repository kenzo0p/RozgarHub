import {v2 as claudinary} from "cloudinary"
import dotenv from 'dotenv'

dotenv.config();
    // Configuration
    claudinary.config({ 
        cloud_name: 'process.env.CLOUD_NAME', 
        api_key: 'process.env.CLOUD_API_KEY', 
        api_secret: 'process.env.CLOUD_API_SECRET' // Click 'View API Keys' above to copy your API secret
    });

    export default claudinary;