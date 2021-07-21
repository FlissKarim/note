# App note
Application developper en JS avec le framework jQuery

## Version v0.1
* Creation et Authentification d'un compte
* Creation/Modification/Suppression de note
* Synchronisation avec le serveur se fait chaque X seconds
  * la note récemment modifiée remplace l'ancienne
* Mettre une note en favoris
* Chercher dans la liste des notes
* Système de notification
  * Echec de connection au serveur / Authentification
  * Synchronisation/Mettre en favoris des notes

## Version v0.2
* Remplacer le "textarea" par une page de mark-up
* Option de mise en forme
  * Bold, Italic
* Correction de bug lors de la synchronisation

## Version v0.3
* Gestion des notes en collisions
  * meme titre
* Ajouter la mise en forme Underline
* Remplacer les texts boutons avec des icons
* Tweaker le UI

## Version v0.4
* Ajouter le bouton "compte" permet de consulter/modifier les données
  * mot de passe
  * date de naissance
  * suppression compte
* Notification depuis le server, informer ou proposer un service a l'utilisateur

## Version v0.5
* Re-struct the server side users hierarcy:
  user
    user_infos
    user_notes
      note1
      favnote1
* Correction body preview of note in list notes view
  * show text instead of html format(showen with html tags)
* Stock les notifications a envoyer aux utilisateurs dans un dictionnaire
  * Promotion /exemple/ depuis un fichier exterieur
  * Souhaiter un bon anniversaire
  * etc
* Ajouter un mise en page liste

## Version v0.6
