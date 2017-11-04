import { Connection } from 'mysql';

export async function query(
    db: Connection,
    query: string,
    values?: any) : Promise<any> {
  return new Promise<any>((resolve, reject) => {
    db.query(query, values, (error, results) => {
      error ? reject(error) : resolve(results);
    });
  });
};

export async function transact<T>(
    db: Connection,
    f: () => Promise<T>): Promise<T> {
  const tryTransaction = () => new Promise<T>((resolve, reject) => {
    db.beginTransaction((error) => {
      if (error) {
        reject(error);
        return;
      }
      f().then((result) => {
        db.commit((error) => {
          if (error) {
            db.rollback(() => reject(error));
          } else {
            resolve(result);
          }
        });
      }).catch((error) => db.rollback(() => reject(error)));
    });
  });
  let result = tryTransaction();
  // Retry the transaction up to 3 times.
  for (let i = 0; i < 3; i++) {
    result = result.catch(tryTransaction);
  }
  return result;
}
