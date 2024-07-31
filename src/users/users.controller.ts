import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Session, UseGuards } from "@nestjs/common";
import { createUserDto } from "./dtos/create-user.dto";
import { UsersService } from "./users.service";
import { updateUserDto } from "./dtos/update-user.dto";
import { Serialize } from "../interceptors/serialize.interceptor";
import { UserDto } from "./dtos/user.dto";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "./user.entity";
import { AuthGuard } from "../guards/auth.guard";

@Controller("auth")
@Serialize(UserDto)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get("/whoami")
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get("/colors/:color")
  setColor(@Param("color") color: string, @Session() session: any) {
    session.color = color;
  }

  @Get("/colors")
  getColor(@Session() session: any) {
    return session.color;
  }

  @Post("/signout")
  signout(@Session() session: any) {
    session.userId = null;
    return;
  }

  @Get("/:id")
  findUser(@Param("id") id: string) {
    return this.userService.findOne(parseInt(id));
  }

  @Get()
  find(@Query("email") email: string) {
    return this.userService.find(email);
  }

  @Post("/signup")
  async createUser(@Body() body: createUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post("/signin")
  async signin(@Body() body: createUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Patch("/:id")
  updateUser(@Param("id") id: string, @Body() body: updateUserDto) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete("/:id")
  deleteUser(@Param("id") id: string) {
    return this.userService.remove(parseInt(id));
  }
}
