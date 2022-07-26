import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  logger.info('Handle Update Todo request', { event })

  try {
    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    const todo: UpdateTodoRequest = JSON.parse(event.body)

    await updateTodo(userId, todoId, todo)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: '',
      isBase64Encoded: false
    }
  } catch (error) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: 'Resource not found',
      isBase64Encoded: false
    }
  }
}
