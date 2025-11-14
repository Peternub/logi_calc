// API для управления конкретной фоновой задачей
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { handleAPIError, validateAuth } from '@/lib/api-utils';
import { TaskScheduler } from '@/lib/task-scheduler';

// GET /api/background-tasks/[id] - получение информации о задаче
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: task, error } = await supabase
      .from('background_tasks')
      .select(`
        *,
        marketplace_accounts(id, name, marketplace)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching background task:', error);
      if (error.code === 'PGRST116') { // No rows returned
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
    }

    return NextResponse.json({ task });

  } catch (error) {
    return handleAPIError(error);
  }
}

// DELETE /api/background-tasks/[id] - отмена задачи
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    validateAuth(user);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, что задача принадлежит пользователю и может быть отменена
    const { data: task, error: checkError } = await supabase
      .from('background_tasks')
      .select('id, status')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (checkError || !task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    if (!['pending', 'running'].includes(task.status)) {
      return NextResponse.json({ 
        error: 'Task cannot be cancelled', 
        details: `Task is in ${task.status} status`
      }, { status: 400 });
    }

    const scheduler = TaskScheduler.getInstance();
    await scheduler.cancelTask(params.id, user.id);

    return NextResponse.json({ message: 'Task cancelled successfully' });

  } catch (error) {
    return handleAPIError(error);
  }
}