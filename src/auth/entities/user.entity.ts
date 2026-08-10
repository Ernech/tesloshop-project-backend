import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities';
import { RefreshToken } from './refresh_tokens.entity';
import { Order } from 'src/orders/entities/order.entity';
import { AddressEntity } from 'src/orders/entities/address.entity';


@Entity('users')
export class User {
    
    @PrimaryGeneratedColumn('uuid',{name:'user_id'})
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text',{name:'full_name'})
    fullName: string;

    @Column('bool', {
        name: 'is_active',
        default: true
    })
    isActive: boolean;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @Column('text',{
        name:'phone_number',
        nullable:true
    })
    phoneNumber:string;

    @Column('timestamp with time zone', { nullable: true, name: 'last_login_at' })
    lastLoginAt: Date;
    
    @Column('int',{name:'login_attempts',default:0})
    loginAttempts:number

    @Column('timestamp with time zone',{name:'block_until',nullable:true})
    blockUntil:Date | null;
    
    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToMany(()=>RefreshToken,(refreshToken)=>refreshToken.user)
    refreshToken:RefreshToken;

    @OneToMany(()=>AddressEntity,(addressEntity)=>addressEntity.user)
    addresses:AddressEntity[];

    @BeforeInsert()
    checkFieldsBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }

}
