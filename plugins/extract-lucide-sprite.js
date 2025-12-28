import fs from 'fs';
import path from 'path';
import { green, red, yellow } from '../siteforge/tools/utils';
/**
 * Main Vite plugin
 */
export function extractLucideSprite(options = {}) {
    const lucide_sprite_path = '../node_modules/lucide-static/sprite.svg';
    const destination_path = '../siteforge/src/lucide_sprite.svg';

    return {
        name: 'extract-lucide-sprite',
        buildEnd() {

            const source = path.resolve(__dirname, lucide_sprite_path);
            const destination = path.resolve(__dirname, destination_path);

            //verify if source file is diferent from destination file
            if (!fs.existsSync(source)) {
                console.error(red, `Source file ${source} does not exist.`);
                return;
            }
            if (fs.existsSync(destination)) {
                const sourceContent = fs.readFileSync(source, 'utf-8');
                const destinationContent = fs.readFileSync(destination, 'utf-8');
                if (sourceContent === destinationContent) {
                    console.log(yellow, `Lucide sprite is up to date. No need to copy.`);
                    return;
                }
            }

            fs.copyFileSync(source, destination);
            console.log(green, `Lucide sprite copied to ${destination}`);
        }
    };
}