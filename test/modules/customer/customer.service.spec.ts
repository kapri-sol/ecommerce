import { faker } from '@faker-js/faker';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@src/entities/account.entity';
import { Customer } from '@src/entities/customer.entity';
import { Order } from '@src/entities/order.entity';
import { Product } from '@src/entities/product.entity';
import { Seller } from '@src/entities/seller.entity';
import { AccountQueryRepository } from '@src/modules/account/account.query-repository';
import { CustomerQueryRepository } from '@src/modules/customer/customer.query-repository';
import { CustomerService } from '@src/modules/customer/customer.service';
import { CreateCustomerDto } from '@src/modules/customer/dto/create-customer.dto';
import { UpdateCustomerDto } from '@src/modules/customer/dto/update-customer.dto';
import { plainToInstance } from 'class-transformer';
import { IBackup } from 'pg-mem';
import { getMemDateSource } from 'test/utils/pg-mem.util';
import { DataSource, Repository } from 'typeorm';

describe('Customer Service', () => {
  let datasource: DataSource;
  let backup: IBackup;
  let app: INestApplication;
  let accountRepository: Repository<Account>;
  let customerQueryRepository: CustomerQueryRepository;
  let customerRepository: Repository<Customer>;
  let customerService: CustomerService;

  const initializeAccount = () => {
    const account = Account.of(
      faker.internet.email(),
      faker.phone.number('+82 10-####-####'),
      faker.internet.password(),
    );

    return accountRepository.save(account);
  };

  const initializeCustomer = async () => {
    const account = await initializeAccount();

    const customer = Customer.of(
      faker.name.fullName(),
      faker.address.streetAddress(),
      account,
    );

    return customerRepository.save(customer);
  };

  beforeAll(async () => {
    await getMemDateSource([Account, Customer, Product, Seller, Order]).then(
      (data) => {
        datasource = data.datasource;
        backup = data.backup;
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(),
        TypeOrmModule.forFeature([Account, Customer]),
      ],
      providers: [
        AccountQueryRepository,
        CustomerQueryRepository,
        CustomerService,
      ],
    })
      .overrideProvider(DataSource)
      .useValue(datasource)
      .compile();

    app = module.createNestApplication();

    accountRepository = datasource.getRepository(Account);
    customerRepository = datasource.getRepository(Customer);
    customerQueryRepository = module.get<CustomerQueryRepository>(
      CustomerQueryRepository,
    );
    customerService = module.get<CustomerService>(CustomerService);

    await app.init();
  });

  afterEach(async () => {
    await backup.restore();
  });

  describe('createCustomer', () => {
    it('????????? ????????????.', async () => {
      // given
      const account = await initializeAccount();

      const createCustomerDto: CreateCustomerDto = plainToInstance(
        CreateCustomerDto,
        {
          name: faker.name.fullName(),
          address: faker.address.streetAddress(),
          accountId: account.id,
        },
      );

      // when
      const customerId = await customerService.createCustomer(
        createCustomerDto,
      );

      // then
      expect(customerId).toStrictEqual(expect.any(BigInt));
    });
  });

  describe('findCustomerById', () => {
    it('????????? id??? ????????????.', async () => {
      // given
      const customer = await initializeCustomer();

      // when
      const findCustomer = await customerService.findCustomerById(customer.id);

      // then
      expect(findCustomer.id).toBe(customer.id);
      expect(findCustomer.name).toBe(customer.name);
      expect(findCustomer.address).toBe(customer.address);
    });

    it('id??? ????????? ????????? ????????? NotFoundException??? ????????????.', async () => {
      // given
      const customerId = BigInt(faker.random.numeric());

      // when
      const findCustomer = () => customerService.findCustomerById(customerId);

      // then
      expect(findCustomer).rejects.toThrowError(NotFoundException);
    });
  });

  describe('updateCustomer', () => {
    it('?????? ????????? ????????????.', async () => {
      // given
      const customer = await initializeCustomer();

      const updateCustomerDto: UpdateCustomerDto = {
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      };

      // when
      await customerService.updateCustomer(customer.id, updateCustomerDto);

      const updateCustomer = await customerQueryRepository.findOneById(
        customer.id,
      );

      // then
      expect(updateCustomer.id).toBe(customer.id);
      expect(updateCustomer.name).toBe(updateCustomerDto.name);
      expect(updateCustomer.address).toBe(updateCustomerDto.address);
    });

    it('????????? ????????? ????????? ????????? NotFoundException??? ?????????.', async () => {
      // given
      const customerId = BigInt(faker.random.numeric());
      const updateCustomerDto: UpdateCustomerDto = {
        name: faker.name.fullName(),
        address: faker.address.streetAddress(),
      };

      // when
      const updateCustomer = () =>
        customerService.updateCustomer(customerId, updateCustomerDto);

      // then
      expect(updateCustomer).rejects.toThrowError(NotFoundException);
    });
  });

  describe('removeCustomer', () => {
    it('?????? ????????? ????????????.', async () => {
      // given
      const customer = await initializeCustomer();

      // when
      await customerService.removeCustomer(customer.id);

      const deleteCustomer = await customerQueryRepository.findOneById(
        customer.id,
      );

      // then
      expect(deleteCustomer).toBeNull();
    });

    it('?????? ?????? ????????? ??????????????? ?????? NotFoundException??? ?????????.', async () => {
      // given
      const customerId = BigInt(faker.random.numeric());

      // when
      const removeCustomer = () => customerService.removeCustomer(customerId);

      // then
      expect(removeCustomer).rejects.toThrowError(NotFoundException);
    });
  });
});
