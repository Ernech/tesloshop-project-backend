import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('refresh_tokens')
export class RefreshToken{

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({name:'token', type:'text'})
    token:string;

    @Column({default:true})
    isActive:boolean

    @CreateDateColumn({
        type: 'timestamp', 
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'id' })
    user: User;


}