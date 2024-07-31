import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email, password: string) => {
        const user = { id: Math.floor(Math.random() * 99999), email, password } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: UsersService, useValue: fakeUsersService }],
    }).compile();

    service = module.get(AuthService);
  });

  it("can create an instance of auth service", async () => {
    expect(service).toBeDefined();
  });

  it("create a new user with a salted and hashed password", async () => {
    const user = await service.signup("asdf@asdf.com", "asdf");

    expect(user.password).not.toEqual("asf");
    const [hash, salt] = user.password.split(".");
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it("throws an error if user signs up with email that is in use", async () => {
    await service.signup("asdf@asdf.com", "asdf");
    await expect(service.signup("asdf@asdf.com", "asdf")).rejects.toThrow(BadRequestException);
  });

  it("throws if signin is called with an unused email", async () => {
    await expect(service.signin("asdflkj@asdlfkj.com", "passdflkj")).rejects.toThrow(NotFoundException);
  });

  it("throws if an invalid password is provided", async () => {
    await service.signup("laskdjf@alskdfj.com", "password");
    await expect(service.signin("laskdjf@alskdfj.com", "laksdlfkj")).rejects.toThrow(BadRequestException);
  });

  it("returns a user if correct password is provided", async () => {
    /* fakeUsersService.find = () =>
      Promise.resolve([
        {
          email: "asdf@asdf.com",
          password: "1f3f1f78b727fa56.af7186ab0d0a8e9cf1ae2c5c179784947a2fe349d3a3e82f6422c0d7cbc2f925",
        } as User,
      ]); */
    await service.signup("asdf@asdf.com", "mypassword");

    const user = await service.signin("asdf@asdf.com", "mypassword");
    expect(user).toBeDefined();
  });
});
