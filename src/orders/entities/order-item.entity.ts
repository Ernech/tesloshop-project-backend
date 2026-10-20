import { Product } from "src/products/entities";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,  } from "typeorm";
import { Order } from "./order.entity";
import { ProductSize } from "src/products/enums/product-size.enum";

@Entity('order_item')
export class OrderItem{

    @PrimaryGeneratedColumn('uuid',{name:'order_item_id'})
    id:string;

    @Column('varchar',{name:'product_name'})
    productName:string;

    @Column({name:'quantity'})
    quantity:number;

    @Column({
        type: 'enum',
        enum: ProductSize,
        name: 'selected_size'
    })
    selectedSize: ProductSize;

    @Column('varchar', { name: 'selected_gender', length: 20 })
    selectedGender: string;

    @Column('varchar', { name: 'product_image', nullable: true })
    productImage: string;

    @Column('jsonb', { name: 'product_snapshot', nullable: true })
    productSnapshot: Record<string, any>; 
    
    @Column('uuid', { name: 'product_id' })
    productId: string;;

    @Column('numeric', {name:'price', precision: 10, scale: 2 }) 
    price: number;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({name:'order_id',referencedColumnName:'id'})
    order: Order;

    @ManyToOne(() => Product, { onDelete: 'RESTRICT' }) 
    @JoinColumn({name:'product_id',referencedColumnName:'id'})
    product: Product;

}