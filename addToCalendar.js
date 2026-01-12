/**
 * Script d'automatisation pour calendrier cycliste.
 * Parcourt les lignes d'un Google Sheets pour créer des événements dans Google Agenda.
 * Gère l'idempotence via la colonne D.
 */
function addToCalendar() {
  var feuille = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var agenda = CalendarApp.getDefaultCalendar();
  
  // Récupère l'ensemble des données de la feuille (nom, date, heure, statut)
  var donnees = feuille.getDataRange().getValues();
  
  for (var i = 1; i < donnees.length; i++) {
    var dejaImporte = donnees[i][3]; // Colonne D (index 3) : Statut de l'import
    
    // Vérification de l'idempotence : on saute la ligne si elle est déjà marquée "Importé"
    if (dejaImporte !== "") continue;

    var nom = donnees[i][0]; // Colonne A : Nom de la course
    var dateLigne = new Date(donnees[i][1]); // Colonne B : Date
    
    // --- Configuration du créneau horaire (13h00 - 13h30) ---
    // On crée l'objet de début basé sur la date du tableau
    var debutRappel = new Date(dateLigne);
    debutRappel.setHours(13, 0, 0); 
    
    // On crée l'objet de fin (30 minutes plus tard)
    var finRappel = new Date(dateLigne);
    finRappel.setHours(13, 30, 0); 
    
    // --- Création de l'événement dans l'agenda par défaut ---
    var event = agenda.createEvent(nom, debutRappel, finRappel);
    
    // Gestion des notifications : on supprime les alertes par défaut de l'utilisateur
    // pour forcer un rappel unique au moment précis du début de l'événement (13h).
    event.removeAllReminders();
    event.addPopupReminder(0); 

    // --- Mise à jour du fichier source ---
    // On marque la ligne comme importée pour ne pas la traiter au prochain clic
    // getRange utilise des index commençant à 1 (i + 1 car la boucle i démarre à 0)
    feuille.getRange(i + 1, 4).setValue("Importé");

    Logger.log('Événement ajouté avec succès : ' + nom);
  }
}