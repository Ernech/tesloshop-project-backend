import { Product } from "src/products/entities";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn,  } from "typeorm";
import { Order } from "./order.entity";

@Entity('order_item')
export class OrderItem{

    @PrimaryGeneratedColumn('uuid',{name:'order_item_id'})
    id:string;

    @Column('varchar',{name:'product_name'})
    productName:string;

    @Column({name:'quantity'})
    quantity:number;

    @Column('numeric', {name:'price', precision: 10, scale: 2 }) // 👈 Congela el precio histórico
    price: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' }) 
    product: Product;

}