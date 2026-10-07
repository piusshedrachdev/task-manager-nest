import { Injectable } from '@nestjs/common';
import {Return} from '../utils/interface/interface.js'
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import {ConfigService} from '@nestjs/config'

@Injectable()
export class DbService {
    private readonly rootDir: string;

    constructor(configService: ConfigService) {
        this.rootDir = path.resolve(configService.get<string>("DATA_ROOT_DIR") ?? process.cwd());
    }

    async write(filename: string, data: string): Promise<void> {
        await fs.mkdir(this.rootDir, { recursive: true });
        const filePath = this.getDataPath(filename);
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
            await fs.mkdir(this.rootDir, { recursive: true });
            const data = await fs.readFile(this.getDataPath(filename), { encoding: "utf8" });
            return { success: true, data };
        } catch (error) {
            return { success: false, error };
        }
    }

    private getDataPath(filename: string): string {
        const filePath = path.resolve(this.rootDir, filename);
        const relativePath = path.relative(this.rootDir, filePath);
        if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) throw new Error("Data file must be inside DATA_ROOT_DIR");
        return filePath;
    }
}