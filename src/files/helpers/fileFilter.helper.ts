

export const fileFilter = ( 
  _req: Request, 
  file: Express.Multer.File, 
  // Reemplazamos 'Function' por la firma explícita:
  callback: (error: Error | null, acceptFile: boolean) => void 
): void => { // <-- Definimos también el tipo de retorno de la función principal

    if ( !file ) {
        callback( new Error('File is empty'), false );
        return;
    }

    const fileExptension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if ( validExtensions.includes( fileExptension ) ) {
        callback( null, true );
        return;
    }

    callback( null, false );
};
