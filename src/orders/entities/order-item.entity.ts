import { Product } from "src/products/entities";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,  } from "typeorm";
import { Order } from "./order.entity";

@Entity('order_item')
export class OrderItem{

    @PrimaryGeneratedColumn('uuid',{name:'order_item_id'})
    id:string;

    @Column('varchar',{name:'product_name'})
    productName:string;

    @Column({name:'quantity'})
    quantity:number;

    @Column('numeric', {name:'price', precision: 10, scale: 2 }) 
    price: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({name:'order_id',referencedColumnName:'id'})
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' }) 
    @JoinColumn({name:'product_id',referencedColumnName:'id'})
    product: Product;

}