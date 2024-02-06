// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';



export type SwapProps = Omit<Swap, NonNullable<FunctionPropertyNames<Swap>>| '_name'>;

export class Swap implements Entity {

    constructor(
        
        id: string,
        transactionHash: string,
        blockHeight: bigint,
        date: Date,
        sender: string,
        offerAsset: string,
        askAsset: string,
        offerAmount: bigint,
        returnAmount: bigint,
        recipient: string,
    ) {
        this.id = id;
        this.transactionHash = transactionHash;
        this.blockHeight = blockHeight;
        this.date = date;
        this.sender = sender;
        this.offerAsset = offerAsset;
        this.askAsset = askAsset;
        this.offerAmount = offerAmount;
        this.returnAmount = returnAmount;
        this.recipient = recipient;
        
    }

    public id: string;
    public transactionHash: string;
    public blockHeight: bigint;
    public date: Date;
    public sender: string;
    public offerAsset: string;
    public askAsset: string;
    public offerAmount: bigint;
    public returnAmount: bigint;
    public recipient: string;
    

    get _name(): string {
        return 'Swap';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save Swap entity without an ID");
        await store.set('Swap', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove Swap entity without an ID");
        await store.remove('Swap', id.toString());
    }

    static async get(id:string): Promise<Swap | undefined>{
        assert((id !== null && id !== undefined), "Cannot get Swap entity without an ID");
        const record = await store.get('Swap', id.toString());
        if (record) {
            return this.create(record as SwapProps);
        } else {
            return;
        }
    }

    static async getByDate(date: Date): Promise<Swap[] | undefined>{
      const records = await store.getByField('Swap', 'date', date);
      return records.map(record => this.create(record as SwapProps));
    }

    static async getBySender(sender: string): Promise<Swap[] | undefined>{
      const records = await store.getByField('Swap', 'sender', sender);
      return records.map(record => this.create(record as SwapProps));
    }

    static async getByFields(filter: FieldsExpression<SwapProps>[], options?: { offset?: number, limit?: number}): Promise<Swap[]> {
        const records = await store.getByFields('Swap', filter, options);
        return records.map(record => this.create(record as SwapProps));
    }

    static create(record: SwapProps): Swap {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.transactionHash,
            record.blockHeight,
            record.date,
            record.sender,
            record.offerAsset,
            record.askAsset,
            record.offerAmount,
            record.returnAmount,
            record.recipient,
        );
        Object.assign(entity,record);
        return entity;
    }
}
