import React from "react";
import { useSelector } from "react-redux";

function ChatPage() {
  const { user } = useSelector((store) => store.auth);
  return (
    <div>
      <section className="flex ml-[16%] h-screen">
        <h1 className="font-bold px-3 mb-4 text-xl">{user.fullname}</h1>
        <hr className="mb-4 border-gray-500" />
        <div className="overflow-y-auto h-[80vh]">
            {
            
            }
        </div>
      </section>
    </div>
  );
}

export default ChatPage;
