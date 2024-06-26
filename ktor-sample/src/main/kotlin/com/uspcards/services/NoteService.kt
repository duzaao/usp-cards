package com.uspcards.services


import com.uspcards.models.Note
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class NoteService(database: Database) {

    private object Notes : Table() {
        val id = uuid("id")
        var userId = uuid("userId")
        val titleFront = varchar("titleFront", 255)
        val messageFront = varchar("messageFront", length = 255)
        val titleBack = varchar("titleBack", length = 255)
        val messageBack = varchar("messageBack", length = 255)
        val priority = integer("priority")

        override val primaryKey = PrimaryKey(id)
    }

    init {
        transaction(database) {
            SchemaUtils.create(Notes)
        }
    }

    private suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }

    suspend fun findAll(userId: UUID): List<Note> = dbQuery {
        Notes.select{Notes.userId eq userId}
            .map { row -> row.toNote() }
    }

    suspend fun findAllOrderedByPriority(userId: UUID): List<Note> = dbQuery {
        Notes.select { (Notes.userId eq userId) and (Notes.priority greater 0) }
            .orderBy(Notes.priority to SortOrder.DESC)
            .map { row -> row.toNote() }
    }

    suspend fun findById(userId:UUID, id: UUID): Note? {
        return dbQuery {
            Notes.select { (Notes.userId eq userId) and (Notes.id eq id) }
                .map { row -> row.toNote() }
                .singleOrNull()
        }
    }

    suspend fun save(userId: UUID, note: Note): Note = dbQuery {
        Notes.insertIgnore {
            it[id] = note.id
            it[Notes.userId] = userId
            it[titleFront] = note.titleFront
            it[messageFront] = note.messageFront
            it[titleBack] = note.titleBack
            it[messageBack] = note.messageBack
            it[priority] = note.priority
        }.let {
            Note(
                id = it[Notes.id],
                titleFront = it[Notes.titleFront],
                messageFront = it[Notes.messageFront],
                titleBack = it[Notes.titleBack],
                messageBack = it[Notes.messageBack],
                priority = it[Notes.priority]
            )
        }
    }

    suspend fun update(userId: UUID, note: Note): Note = dbQuery {
        val updatedRows = Notes.update({ Notes.id eq note.id }) {
            it[Notes.userId] = userId
            it[titleFront] = note.titleFront
            it[messageFront] = note.messageFront
            it[titleBack] = note.titleBack
            it[messageBack] = note.messageBack
            it[priority] = note.priority
        }

        if (updatedRows > 0) {
            // Retorne a nota atualizada
            Notes.select { Notes.id eq note.id }.map {
                Note(
                    id = it[Notes.id],
                    titleFront = it[Notes.titleFront],
                    messageFront = it[Notes.messageFront],
                    titleBack = it[Notes.titleBack],
                    messageBack = it[Notes.messageBack],
                    priority = it[Notes.priority]
                )
            }.single()
        } else {
            throw IllegalArgumentException("Note not found")
        }
    }


    suspend fun delete(userId: UUID, id: UUID) {
        dbQuery {
            Notes.deleteWhere { (Notes.userId eq userId) and ( Notes.id.eq(id)) }
        }
    }

    private fun ResultRow.toNote() = Note(
        id = this[Notes.id],
        titleFront = this[Notes.titleFront],
        messageFront = this[Notes.messageFront],
        titleBack = this[Notes.titleBack],
        messageBack = this[Notes.messageBack],
        priority = this[Notes.priority]
    )

}
