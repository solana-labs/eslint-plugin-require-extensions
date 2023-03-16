const { existsSync } = require('fs');
const { dirname, resolve } = require('path');

module.exports = {
    configs: {
        recommended: {
            plugins: ['require-extensions'],
            rules: {
                'require-extensions/require-extensions': 'error',
            },
        },
    },
    rules: {
        'require-extensions': {
            meta: {
                fixable: true,
            },
            create(context) {
                function rule(node) {
                    const source = node.source;
                    if (!source) return;
                    const value = source.value.replace(/\?.*$/, '');
                    if (!value || !value.startsWith('.') || value.endsWith('.js')) return;

                    if (!existsSync(resolve(dirname(context.getFilename()), value))) {
                        let fix
                        if(!source.value.includes('?')) {
                            fix = (fixer) => {
                                return fixer.replaceText(source, `'${value}.js'`);
                            }
                        }

                        context.report({
                            node,
                            message: 'Relative imports and exports must end with .js',
                            fix,
                        });
                    }
                }

                return {
                    DeclareExportDeclaration: rule,
                    DeclareExportAllDeclaration: rule,
                    ExportAllDeclaration: rule,
                    ExportNamedDeclaration: rule,
                    ImportDeclaration: rule,
                };
            },
        },
    }
};
