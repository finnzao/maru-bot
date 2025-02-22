const fs = require('fs');
const path = require('path');

const PERMISSIONS_PATH = path.join(__dirname, '../config/permissions.json');

function loadPermissions() {
  try {
    const data = fs.readFileSync(PERMISSIONS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao carregar permissões: ${error}`);
    // Retorna um objeto vazio ou um padrão para não quebrar o fluxo
    return { Maxima: [], Media: [], Baixa: [] };
  }
}

function savePermissions(permissions) {
  try {
    fs.writeFileSync(PERMISSIONS_PATH, JSON.stringify(permissions, null, 2));
  } catch (error) {
    console.error(`Erro ao salvar permissões: ${error}`);
  }
}

function getMemberPermissionLevel(member) {
  try {
    const permissions = loadPermissions();
    const priority = ['Maxima', 'Media', 'Baixa'];

    for (const level of priority) {
      for (const roleId of permissions[level]) {
        if (member.roles.cache.has(roleId)) {
          return level;
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao obter nível de permissão do membro: ${error}`);
  }

  return null;
}

module.exports = {
  loadPermissions,
  savePermissions,
  getMemberPermissionLevel
};
