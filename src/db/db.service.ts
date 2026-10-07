import { Injectable } from '@nestjs/common';
import {Return} from '../utils/interface/interface.js'
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {ConfigService} from '@nestjs/config'

const rootDir = path.resolve(ConfigService.get("DATA_ROOT_DIR") ?? process.cwd());


@Injectable()
export class DbService {

    async write(filename: string, data: string): Promise<void> {
        await fs.mkdir(rootDir, { recursive: true });
        const filePath = getDataPath(filename);
        const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
        try {
            await fs.writeFile(temporaryPath, data, { encoding: "utf8" });
            await fs.rename(temporaryPath, filePath);
        } catch (error) {
            await fs.rm(temporaryPath, { force: true }).catch(() => undefined);
            throw error;
        }
    }

    async read(filename: string): Promise<Return<string>> {
        try {
            await fs.mkdir(rootDir, { recursive: true });
            const data = await fs.readFile(getDataPath(filename), { encoding: "utf8" });
            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    }

}

function getDataPath(filename: string): string {
  const filePath = path.resolve(rootDir, filename);
  const relativePath = path.relative(rootDir, filePath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) throw new Error("Data file must be inside DATA_ROOT_DIR");
  return filePath;
}