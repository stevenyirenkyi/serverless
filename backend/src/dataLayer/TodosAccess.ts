import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
  constructor(
    private docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private tableName = process.env.TODOS_TABLE,
    private indexName = process.env.TODOS_BY_USER_INDEX
  ) {}

  async getTodoItems(userId: string): Promise<TodoItem[]> {
    try {
      const result = await this.docClient
        .query({
          TableName: this.tableName,
          IndexName: this.indexName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()

      logger.info(`Get todo items for user: ${result} - ${userId}`)

      return result.Items as TodoItem[]
    } catch (error) {
      return error
    }
  }

  async getTodoItem(todoId: string, userId): Promise<TodoItem> {
    const result = await this.docClient
      .get({
        TableName: this.tableName,
        Key: { todoId, userId }
      })
      .promise()

    logger.info(`Get todo item — ${todoId}`)
    return result.Item as TodoItem
  }

  async createTodoItem(todoItem: TodoItem) {
    await this.docClient
      .put({
        TableName: this.tableName,
        Item: todoItem
      })
      .promise()

    logger.info(`Create todo item — ${todoItem.todoId}`)
  }

  async updateTodoItem(todoId: string, todoUpdate: TodoUpdate, userId) {
    try {
      await this.docClient
        .update({
          TableName: this.tableName,
          Key: {
            todoId,
            userId
          },
          UpdateExpression:
            'set #name = :name, dueDate = :dueDate, done = :done',
          ExpressionAttributeNames: {
            '#name': 'name'
          },
          ExpressionAttributeValues: {
            ':name': todoUpdate.name,
            ':dueDate': todoUpdate.dueDate,
            ':done': todoUpdate.done
          }
        })
        .promise()

      logger.info(`Update todo item — ${todoId}`)
    } catch (error) {
      return error
    }
  }

  async deleteTodoItem(todoId: string, userId) {
    try {
      const res = await this.docClient
        .delete({
          TableName: this.tableName,
          Key: {
            todoId,
            userId
          }
        })
        .promise()

      logger.info(`Delete todo item — ${todoId}`)
      return res
    } catch (error) {
      return error
    }
  }

  async updateAttachmentUrl(todoId: string, userId, attachmentUrl: string) {
    await this.docClient
      .update({
        TableName: this.tableName,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': attachmentUrl
        }
      })
      .promise()

    logger.info(`Update attachment URL for todo — ${todoId} `)
  }
}
