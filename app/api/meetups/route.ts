// app/api/meetups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

 const cookieStore = cookies();
 const supabase = createClient(await cookieStore);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      meetup_date,
      meetup_time,
      end_time,
      location,
      location_details,
      payment_required,
      payment_amount,
      payment_instructions,
      max_slots,
      book_id,
      created_by,
      // Optional: new book data if creating a new book
      new_book
    } = body;

    let finalBookId = book_id;

    // If creating a new book
    if (new_book && !book_id) {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .insert({
          title: new_book.title,
          author: new_book.author,
          description: new_book.description,
          genre: new_book.genre,
          start_date: new_book.start_date,
          end_date: new_book.end_date,
        })
        .select()
        .single();

      if (bookError) {
        return NextResponse.json(
          { error: 'Failed to create book', details: bookError.message },
          { status: 400 }
        );
      }

      finalBookId = bookData.id;
    }

    // Create meetup
    const { data: meetupData, error: meetupError } = await supabase
      .from('meetups')
      .insert({
        title,
        description,
        meetup_date,
        meetup_time,
        end_time,
        location,
        location_details,
        payment_required,
        payment_amount: payment_required ? payment_amount : null,
        payment_instructions: payment_required ? payment_instructions : null,
        max_slots,
        book_id: finalBookId,
        created_by,
        status: 'upcoming',
      })
      .select()
      .single();

    if (meetupError) {
      return NextResponse.json(
        { error: 'Failed to create meetup', details: meetupError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: meetupData },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    );
  }
}