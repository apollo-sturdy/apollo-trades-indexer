// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';



export type CoinPriceProps = Omit<CoinPrice, NonNullable<FunctionPropertyNames<CoinPrice>>| '_name'>;

export class CoinPrice implements Entity {

    constructor(
        
        id: string,
        coingeckoId: string,
        date: Date,
        price: number,
    ) {
        this.id = id;
        this.coingeckoId = coingeckoId;
        this.date = date;
        this.price = price;
        
    }

    public id: string;
    public coingeckoId: string;
    public date: Date;
    public price: number;
    

    get _name(): string {
        return 'CoinPrice';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save CoinPrice entity without an ID");
        await store.set('CoinPrice', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove CoinPrice entity without an ID");
        await store.remove('CoinPrice', id.toString());
    }

    static async get(id:string): Promise<CoinPrice | undefined>{
        assert((id !== null && id !== undefined), "Cannot get CoinPrice entity without an ID");
        const record = await store.get('CoinPrice', id.toString());
        if (record) {
            return this.create(record as CoinPriceProps);
        } else {
            return;
        }
    }

    static async getByCoingeckoId(coingeckoId: string): Promise<CoinPrice[] | undefined>{
      const records = await store.getByField('CoinPrice', 'coingeckoId', coingeckoId);
      return records.map(record => this.create(record as CoinPriceProps));
    }

    static async getByDate(date: Date): Promise<CoinPrice[] | undefined>{
      const records = await store.getByField('CoinPrice', 'date', date);
      return records.map(record => this.create(record as CoinPriceProps));
    }

    static async getByFields(filter: FieldsExpression<CoinPriceProps>[], options?: { offset?: number, limit?: number}): Promise<CoinPrice[]> {
        const records = await store.getByFields('CoinPrice', filter, options);
        return records.map(record => this.create(record as CoinPriceProps));
    }

    static create(record: CoinPriceProps): CoinPrice {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.coingeckoId,
            record.date,
            record.price,
        );
        Object.assign(entity,record);
        return entity;
    }
}
