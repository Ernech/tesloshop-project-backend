import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { ProductImage } from './';
import { User } from '../../auth/entities/user.entity';

@Entity({ name: 'products' })
export class Product {

    @ApiProperty({
        example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid',{name:'product_id'})
    id: string;

    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float',{
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Anim reprehenderit nulla in anim mollit minim irure commodo.',
        description: 'Product description',
        default: null,
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product SLUG - for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M','XL','XXL'],
        description: 'Product sizes',
    })
    @Column('text',{
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender',
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        description: 'Search keywords and filter labels used to group products and improve searchability across the store',
        example: ['shirt', 'apparel', 'classic', 'tesla'],
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];
    
    @ApiProperty({ readOnly: true, example: '2026-08-03T20:15:00.000Z' })
    @CreateDateColumn({
        name: 'created_at',
        type: 'timestamp', 
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @ApiProperty({ readOnly: true, example: '2026-08-03T20:15:00.000Z' })
    @CreateDateColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate:'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
    // images
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];


    @BeforeInsert()
  checkSlugInsert() {
      if ( !this.slug ) {
          this.slug = this.title;
      }
      this.sanitizeSlug();
  }

  @BeforeUpdate()
  checkSlugUpdate() {
     
      if ( !this.slug ) {
          this.slug = this.title;
      }
      this.sanitizeSlug();
  }

  
  private sanitizeSlug() {
      this.slug = this.slug
        .toLowerCase()
        .trim()
        .replaceAll(' ', '-') 
        .replaceAll('_', '-') 
        .replaceAll("'", '');
  }

}
