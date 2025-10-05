import crypto from 'crypto'

export async function generateUniqueHash(text:string){

    const hash = await crypto.createHash('sha256').update(`${Math.random()}.${text}`);
    return hash.digest()


}