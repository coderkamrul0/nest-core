/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { CreateCoffeeDto } from './dto/create-coffee.dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto/update-coffee.dto';
import { Connection, Model } from 'mongoose';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  findAll() {
    return this.coffeeModel.find().exec();
  }
  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }
  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);
    return coffee.save();
  }
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec();
    if(!existingCoffee){
      throw new NotFoundException(`Coffee #${id} not found`)
    }
    return existingCoffee;
  }
  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeModel.deleteOne({ _id: id }).exec();
  }

  async recommendCoffee(coffee: Coffee){
    const session = await this.connection.startSession();
    session.startTransaction();
    try{
      coffee.recommendation++;
      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: {coffeeId: coffee.id}
      })
      await recommendEvent.save({session});
      await coffee.save({session})
      
      await session.commitTransaction()
    }catch (err){
      await session.abortTransaction()
    }finally{
      session.endSession();
    }
  }
  
}
