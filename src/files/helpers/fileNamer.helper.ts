import { v4 as uuid } from 'uuid'
import { Request } from 'express';
export const fileNamer = ( 
  _req: Request, 
  file: Express.Multer.File, 
  callback: (error: Error | null, filename: string) => void 
): void => { // <-- Especificamos el tipo de retorno 'void'

    if ( !file ) {
        callback( new Error('File is empty'), '' );
        return;
    }

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${ uuid() }.${ fileExtension }`;

    callback( null, fileName );
};