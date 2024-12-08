import React from "react";
import { Input } from "./ui/input";
import { Button } from "react-scroll";

function ChatPage() {
  return (
    <div className="flex">
      <div className="py-4 px-8 h-screen w-[20%] border">
        <div className="font-bold text-xl border-b-gray-600 border-b-2">
          Chats
        </div>
        <div className="mt-3 cursor-pointer">
          <div className="flex flex-col p-2 border-b-2">
            <div className="flex align-center  gap-2">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSG2h3dtkFclxksGm2bXE8R53sUemVyVGmJTg&s"
                className="rounded-full w-10 h-10"
                alt="person img"
              />
              <div>
                <p>Om</p>
                <p className="text-sm text-gray-450">message</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full p-4 overflow-y-auto">
        <div>hii</div>
        <div className="flex items-center absolute bottom-0 p-4 border-t border-t-gray-300">
          <Input
            type="text"
            className="flex-1  mr-2 focus-visible:ring-transparent"
            placeholder="Enter your Messages..."
          />
          <Button className="bg-blue-500 px-3 py-1.5 text-white rounded-md">Send</Button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
