import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PrimaryGenerateBigintColumn } from 'src/decorator/primary-generate-bigint-column.decorator';
import { Customer } from './customer.entity';

@Entity()
export class Account {
  @PrimaryGenerateBigintColumn({
    name: 'account_id',
    primaryKeyConstraintName: 'PK_ACCOUND_ID',
  })
  private _id: bigint;

  @OneToOne(() => Customer, (customer: Customer) => customer)
  private _customer: Customer;

  @Column({
    name: 'email',
    unique: true,
  })
  private _email: string;

  @Column({
    name: 'phone',
    unique: true,
  })
  private _phone: string;

  @Column({
    name: 'password',
  })
  private _password: string;

  @CreateDateColumn({
    name: 'created_at',
  })
  private _createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
  })
  private _updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
  })
  private _deletedAt: Date;

  /**
   * Account 인스턴스를 생성한다.
   *
   * @static
   * @param {string} email
   * @param {string} phone
   * @param {string} password
   * @return {*}  {Account}
   * @memberof Account
   */
  static of(email: string, phone: string, password: string): Account {
    const account = new Account();
    account._email = email;
    account._phone = phone;
    account._password = password;
    return account;
  }

  get id() {
    return this._id;
  }

  set id(id: bigint) {
    this._id = id;
  }

  get customer() {
    return this._customer;
  }

  set customer(customer: Customer) {
    this._customer = customer;
  }

  get email() {
    return this._email;
  }

  get phone() {
    return this._phone;
  }

  changePhone(phone: string) {
    this._phone = phone;
  }

  get password() {
    return this._password;
  }

  changePassword(password: string) {
    this._password = password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    this._password = await bcrypt.hashSync(this.password, 10);
  }
}
