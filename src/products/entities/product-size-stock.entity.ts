import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ProductSize } from "../enums/product-size.enum";
import { Product } from "./product.entity";


@Entity('product_size_stock')
@Index(['product','size'],{unique:true})
export class ProductSizeStock{

    @PrimaryGeneratedColumn('uuid',{name:'product_size_stock_id'})
    id:string;

  @Column({
    type: 'enum',
    enum: ProductSize,
    name: 'size'
  })
  size: ProductSize; 

  @Column({type:'int',name:'stock',default:0})
  stock:number;

  @ManyToOne(
    () => Product, 
    (product) => product.sizeStocks, 
    { onDelete: 'CASCADE' }
  )
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Product;

}