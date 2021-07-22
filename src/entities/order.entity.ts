import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Cart } from "./cart.entity";

@Index("uq_order_cart_id", ["cartId"], { unique: true })
@Entity("order")
export class Order {
  @PrimaryGeneratedColumn({ 
    type: "int", 
    name: "order_id", 
    unsigned: true 
  })
  orderId: number;

  @Column({
    type: "timestamp",
    name: "created_at",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date;

  @Column({
    type: "int",
    name: "cart_id",
    unique: true,
    unsigned: true,
  })
  cartId: number;

  @Column({
    type: "enum",
    nullable: true,
    enum: ["rejected", " accepted", "shift", "panding"],
    default: () => "'panding'",
  })
  status: "rejected" | " accepted" | "shift" | "panding" | null;

  @OneToOne(
    () => Cart, 
    (cart) => cart.order, { onDelete: "RESTRICT", onUpdate: "CASCADE", }
  )
  @JoinColumn([{ name: "cart_id", referencedColumnName: "cartId" }])
  cart: Cart;
}