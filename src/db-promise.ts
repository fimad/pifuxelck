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
