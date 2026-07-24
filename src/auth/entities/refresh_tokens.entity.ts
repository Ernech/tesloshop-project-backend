import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('refresh_tokens')
export class RefreshToken{

    @PrimaryGeneratedColumn('uuid',{name:"refresh_token_id"})
    id: string;

    @Column({name:'token', type:'text'})
    token:string;

    @Column({ name:'is_active',default:true})
    isActive:boolean

    @CreateDateColumn({
        name:'created_at',
        type: 'timestamp', 
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column({  name:'expires_at',type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' ,referencedColumnName:"id"}) 
    user: User;


}