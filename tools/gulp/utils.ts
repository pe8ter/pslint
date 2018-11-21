import _pump = require('pump');

/**
 * Wrap `pump` in a Promise to automatically handle errors passed to its callback.
 */

export async function pump(...transformers: NodeJS.ReadWriteStream[]): Promise<void> {

    return new Promise<void>((resolve, reject) => {

        _pump(transformers, (err: any) => {

            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
