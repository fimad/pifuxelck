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

export function transact<T>(
    db: Connection,
    f: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
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
}
