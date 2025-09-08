import * as Types from "./types"; // путь подгони под себя

declare module "express-serve-static-core" {
  interface Locals {
    sessionCheck?: Types.localSessionCheck;
    permsCheck?: Types.localPermsCheck;
  }
}