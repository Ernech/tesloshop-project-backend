import { User } from "src/auth/entities/user.entity";
import { Column, CreateDateColumn, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

export class AddressEntity{

    @PrimaryGeneratedColumn('uuid', {name:'address_id'})
    id:string;

    @Column('varchar',{name:'street_address',length:300})
    streetAddress:string;

    @Column('varchar',{name:'city',length:150})
    city:string;

    @Column('varchar',{name:'state',length:100})
    state:string;

    @Column('varchar',{name:'postal_code', length:100})
    postalCode:string;

    @Column('varchar',{name:'country',length:30})
    country:string;

    @Column('boolean',{name:'is_default',default:false})
    isDefault:boolean;

    @ManyToOne(()=>User,(user)=>user.addresses, { onDelete:'CASCADE' })
    @JoinColumn({name:'user_id',referencedColumnName:'id'})
    user:User;

    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    createdAt: Date;
}
