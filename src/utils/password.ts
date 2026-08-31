import argon2 from "argon2";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as en from "@zxcvbn-ts/language-en";
import { error } from "../errors/error-factory.js";

export async function hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
        type: argon2.argon2id,
    });
}

export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return argon2.verify(hash, password);
}

const zxcvbn = new ZxcvbnFactory({
    dictionary: {
        ...common.dictionary,
        ...en.dictionary,
    },
    graphs: common.adjacencyGraphs,
    translations: en.translations,
    useLevenshteinDistance: true,
});

export function validatePassword(password: string, userInputs: string[] = []) {
    const result = zxcvbn.check(password, userInputs);

    return result;
}

export function validatePasswordStrength(password: string) {
    const result = zxcvbn.check(password);

    if (result.score < 2) {
        throw error("PASSWORD_TOO_WEAK");
    }

    return result;
}
