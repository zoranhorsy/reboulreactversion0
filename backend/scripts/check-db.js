const pool = require('../db');
const bcrypt = require('bcrypt');

async function checkDatabase() {
    try {
        // Test de connexion
        const connectionTest = await pool.query('SELECT NOW()');
        console.log('Connexion à la base de données réussie:', connectionTest.rows[0].now);

        // Vérification de l'utilisateur
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', ['zoran@reboul.com']);
        if (rows.length === 0) {
            console.log('Aucun utilisateur trouvé avec cet email');
        } else {
            const user = rows[0];
            console.log('Utilisateur trouvé:', {
                id: user.id,
                email: user.email,
                username: user.username,
                is_admin: user.is_admin,
                password_hash_length: user.password_hash.length
            });

            // Test de mot de passe
            const testPassword = 'nouveauMotDePasse123'; // Remplacez par le vrai mot de passe si connu
            const passwordValid = await bcrypt.compare(testPassword, user.password_hash);
            console.log('Test de mot de passe:', testPassword, 'Résultat:', passwordValid ? 'Valide' : 'Invalide');
        }
    } catch (error) {
        console.error('Erreur lors de la vérification de la base de données:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase();

