// Auto-generated , DO NOT EDIT
import {Entity, FunctionPropertyNames, FieldsExpression} from "@subql/types-core";
import assert from 'assert';



export type UserSummaryProps = Omit<UserSummary, NonNullable<FunctionPropertyNames<UserSummary>>| '_name'>;

export class UserSummary implements Entity {

    constructor(
        
        id: string,
        address: string,
        totalSold: bigint,
        totalBought: bigint,
        totalUSDSpent: bigint,
        totalUSDReceived: bigint,
    ) {
        this.id = id;
        this.address = address;
        this.totalSold = totalSold;
        this.totalBought = totalBought;
        this.totalUSDSpent = totalUSDSpent;
        this.totalUSDReceived = totalUSDReceived;
        
    }

    public id: string;
    public address: string;
    public totalSold: bigint;
    public totalBought: bigint;
    public totalUSDSpent: bigint;
    public totalUSDReceived: bigint;
    

    get _name(): string {
        return 'UserSummary';
    }

    async save(): Promise<void>{
        let id = this.id;
        assert(id !== null, "Cannot save UserSummary entity without an ID");
        await store.set('UserSummary', id.toString(), this);
    }

    static async remove(id:string): Promise<void>{
        assert(id !== null, "Cannot remove UserSummary entity without an ID");
        await store.remove('UserSummary', id.toString());
    }

    static async get(id:string): Promise<UserSummary | undefined>{
        assert((id !== null && id !== undefined), "Cannot get UserSummary entity without an ID");
        const record = await store.get('UserSummary', id.toString());
        if (record) {
            return this.create(record as UserSummaryProps);
        } else {
            return;
        }
    }

    static async getByAddress(address: string): Promise<UserSummary[] | undefined>{
      const records = await store.getByField('UserSummary', 'address', address);
      return records.map(record => this.create(record as UserSummaryProps));
    }

    static async getByFields(filter: FieldsExpression<UserSummaryProps>[], options?: { offset?: number, limit?: number}): Promise<UserSummary[]> {
        const records = await store.getByFields('UserSummary', filter, options);
        return records.map(record => this.create(record as UserSummaryProps));
    }

    static create(record: UserSummaryProps): UserSummary {
        assert(typeof record.id === 'string', "id must be provided");
        let entity = new this(
            record.id,
            record.address,
            record.totalSold,
            record.totalBought,
            record.totalUSDSpent,
            record.totalUSDReceived,
        );
        Object.assign(entity,record);
        return entity;
    }
}
